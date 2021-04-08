package com.incture.lch.util;

import org.hibernate.Criteria;
import org.hibernate.Session;
import org.hibernate.criterion.Restrictions;

public class SequenceNumberGenRequestId {
	private static SequenceNumberGenRequestId sequenceNumberGenerator;

	SequenceNumberRequestId sequenceNumber = null;
	private static int oldRunningNumber = 1000;
	private static String oldRefCode = "";

	public SequenceNumberGenRequestId() 
	{
	}

	public static synchronized SequenceNumberGenRequestId getInstance() {
		return sequenceNumberGenerator == null ? sequenceNumberGenerator = new SequenceNumberGenRequestId()
				: sequenceNumberGenerator;
	}

	
	public synchronized String getNextSeqNumber(String referenceCode, Integer noOfDigits, Session session) {
		Criteria criteria = session.createCriteria(SequenceNumberRequestId.class);
		criteria.add(Restrictions.eq("referenceCode", referenceCode));

		sequenceNumber = (SequenceNumberRequestId)criteria.uniqueResult();
		int runningNumber;
		if (sequenceNumber != null) {
			session.refresh(sequenceNumber);
			runningNumber = updateRecord(sequenceNumber, session);
			if (oldRunningNumber == runningNumber && oldRefCode.equals(referenceCode)) 
			{// to
																						
				// avoid
																						
				// duplicates
				Criteria criteria1 = session.createCriteria(SequenceNumberRequestId.class);
				criteria1.add(Restrictions.eq("referenceCode", referenceCode));

				sequenceNumber = (SequenceNumberRequestId) criteria1.uniqueResult();
				runningNumber = updateRecord(sequenceNumber, session);
			}
		} else {
			runningNumber = pushRecord(referenceCode, session);
		}
		oldRunningNumber = runningNumber;
		oldRefCode = referenceCode;
		return buildSeqNumber(referenceCode, noOfDigits, runningNumber);
	}

	private String buildSeqNumber(String referenceCode, Integer noOfDigits, int runningNumber) {
		StringBuffer sb = new StringBuffer(noOfDigits);
		sb.append(runningNumber);
		int noOfPads = noOfDigits - sb.length();
		while (noOfPads-- > 0) {
			sb.insert(0, '0');
		}
		sb.insert(0, referenceCode);
		return sb.toString();
	}

	private int pushRecord(String referenceCode, Session session) {
		SequenceNumberRequestId sequenceNumber = new SequenceNumberRequestId(referenceCode, 1);
		// NOTE: Hard coding to zero
		session.persist(sequenceNumber);
		return sequenceNumber.getRunningNumber();
	}

	private int updateRecord(SequenceNumberRequestId sequenceNumber, Session session) {
		int runningnumber = 0;
		sequenceNumber.setRunningNumber(sequenceNumber.getRunningNumber() + 1);

		session.persist(sequenceNumber);
		session.flush();
		session.refresh(sequenceNumber);
		Criteria criteria = session.createCriteria(SequenceNumberRequestId.class);
		criteria.add(Restrictions.eq("referenceCode", sequenceNumber.getReferenceCode()));

		SequenceNumberRequestId retDto1 = (SequenceNumberRequestId) criteria.uniqueResult();
		if (retDto1 != null) {
			runningnumber = retDto1.getRunningNumber();
		}
		
		return runningnumber;
	}}